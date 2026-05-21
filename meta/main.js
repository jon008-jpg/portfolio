import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm'; 

// --- 1. GLOBAL STATE ---
let data = [];
let commits = [];
let xScale, yScale; 
let commitMaxTime;
let filteredCommits = []; 
let filteredData = []; 

let colors = d3.scaleOrdinal(d3.schemeTableau10);
let scroller1 = scrollama(); 
let scroller2 = scrollama();

// --- 2. DATA LOADING ---
async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  commits = processCommits(data);

  // Initialize visualizations
  renderScatterPlot(data, commits);
  displayStats(data, commits);
  
  // Generate the stories for both sections
  renderItems(commits); 

  // Setup Scrollama for the scatter plot
  scroller1
    .setup({
      container: '#scrolly-1',
      step: '#scrolly-1 .step',
    })
    .onStepEnter(onStepEnter);

  // Setup Scrollama for the file size visualization
  scroller2
    .setup({
      container: '#scrolly-2',
      step: '#scrolly-2 .step',
    })
    .onStepEnter(onStepEnter);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

// --- 3. SCROLLAMA LOGIC ---
function onStepEnter(response) {
  // Get the bound data from the scrolled element
  const commit = response.element.__data__;
  commitMaxTime = commit.datetime;

  // Filter and update visuals based on scroll position
  filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
  filteredData = data.filter((d) => d.datetime <= commitMaxTime);

  updateScatterPlot(filteredData, filteredCommits);
  displayStats(filteredData, filteredCommits);
  updateFileDisplay(filteredCommits);
}

// --- 4. DATA PROCESSING ---
function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      
      let ret = {
        id: commit,
        url: 'https://github.com/jon008-jpg/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        writable: false,
        configurable: false,
        enumerable: false,
      });

      return ret;
    })
    // Sort strictly by datetime to ensure correct storytelling flow
    .sort((a, b) => a.datetime - b.datetime); 
}

// --- 5. STORY GENERATION ---
function renderItems(commits) {
  d3.select('#scatter-story').selectAll('*').remove();
  d3.select('#file-story').selectAll('*').remove();

  // Create the shared HTML rendering logic for the story steps
  const generateStepHtml = (d, i) => `
    <p>
        On ${d.datetime.toLocaleString('en', {
          dateStyle: 'full',
          timeStyle: 'short',
        })},
        I made <a href="${d.url}" target="_blank">${
          i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'
        }</a>.
        I edited ${d.totalLines} lines across ${
          d3.rollups(d.lines, (D) => D.length, (d) => d.file).length
        } files.
        Then I looked over all I had made, and I saw that it was very good.
    </p>
  `;

  // Inject into the Scatter Plot story
  d3.select('#scatter-story')
    .selectAll('.step')
    .data(commits)
    .join('div')
    .attr('class', 'step')
    .style('margin-bottom', '2vh') 
    .html(generateStepHtml);

  // Inject into the File Size Unit Visualization story
  d3.select('#file-story')
    .selectAll('.step')
    .data(commits)
    .join('div')
    .attr('class', 'step')
    .style('margin-bottom', '2vh') 
    .html(generateStepHtml);
}

// --- 6. UI RENDERING ---
function displayStats(currentData, currentCommits) {
  const container = d3.select('#stats');
  container.selectAll('*').remove();

  const numberOfFiles = d3.groups(currentData, (d) => d.file).length;
  const maxDepth = d3.max(currentData, (d) => d.depth) || 0;
  const longestLine = d3.max(currentData, (d) => d.length) || 0;
  const maxLines = d3.max(currentData, (d) => d.line) || 0;

  const dl = container.append('dl').attr('class', 'stats');

  const statsToShow = [
    { label: 'Commits', value: currentCommits.length },
    { label: 'Files', value: numberOfFiles },
    { label: 'Total <abbr title="Lines of Code">LOC</abbr>', value: currentData.length, isHtml: true },
    { label: 'Max Depth', value: maxDepth },
    { label: 'Longest Line', value: longestLine },
    { label: 'Max Lines', value: maxLines },
  ];

  statsToShow.forEach(stat => {
    const group = dl.append('div').attr('class', 'stat-pair');
    if (stat.isHtml) group.append('dt').html(stat.label);
    else group.append('dt').text(stat.label);
    group.append('dd').text(stat.value);
  });
}

function updateFileDisplay(filteredCommits) {
  let lines = filteredCommits.flatMap((d) => d.lines);
  
  let files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => {
      return { name, lines };
    })
    .sort((a, b) => b.lines.length - a.lines.length);

  let filesContainer = d3
    .select('#files')
    .selectAll('div')
    .data(files, (d) => d.name)
    .join(
      (enter) =>
        enter.append('div').call((div) => {
          div.append('dt');
          div.append('dd');
        })
    );

  filesContainer.select('dt').html((d) => 
    `<code>${d.name}</code><small>${d.lines.length} lines</small>`
  );

  filesContainer.select('dd')
    .selectAll('div')
    .data(d => d.lines)
    .join('div')
    .attr('class', 'loc')
    .style('--color', (d) => colors(d.type)); 
}

// --- 7. TOOLTIP LOGIC ---
function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time-tooltip'); 
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) return;

  if (link) {
    link.href = commit.url;
    link.textContent = commit.id;
  }
  if (date) date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
  if (time) time.textContent = commit.time;
  if (author) author.textContent = commit.author;
  if (lines) lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  if (tooltip) tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  if (tooltip) {
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
  }
}

// --- 8. BRUSHING LOGIC ---
function brushed(event) {
  const selection = event.selection;
  
  d3.selectAll('circle').classed('selected', (d) => 
    isCommitSelected(selection, d)
  );

  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}

function isCommitSelected(selection, commit) {
  if (!selection) return false;

  const [[x0, y0], [x1, y1]] = selection;
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);

  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function renderSelectionCount(selection) {
  const countElement = document.getElementById('selection-count');
  if (!countElement) return [];
  
  const selectedCommits = selection
    ? filteredCommits.filter((d) => isCommitSelected(selection, d))
    : [];

  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function renderLanguageBreakdown(selection) {
  const selectedCommits = selection
    ? filteredCommits.filter((d) => isCommitSelected(selection, d))
    : [];
  const container = document.getElementById('language-breakdown');
  
  if (!container) return;

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  const lines = selectedCommits.flatMap((d) => d.lines);

  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type,
  );

  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <div class="stat-pair">
                <dt>${language}</dt>
                <dd>${count} lines (${formatted})</dd>
            </div>
        `;
  }
}

function createBrushSelector(svg) {
  svg.call(d3.brush().on('start brush end', brushed));
  svg.selectAll('.dots, .overlay ~ *').raise();
}

// --- 9. SCATTERPLOT RENDERING & UPDATING ---
function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const margin = { top: 10, right: 10, bottom: 30, left: 50 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  gridlines.call(
    d3.axisLeft(yScale)
      .tickFormat('')
      .tickSize(-usableArea.width)
  );

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  svg.append('g')
    .attr('class', 'axis x-axis') 
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  svg.append('g')
    .attr('class', 'axis y-axis')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  const dots = svg.append('g').attr('class', 'dots');
  createBrushSelector(svg); // Create empty brush framework
}

function updateScatterPlot(data, currentCommits) {
  const svg = d3.select('#chart').select('svg');
  const domainCommits = currentCommits.length ? currentCommits : commits;
  
  xScale.domain(d3.extent(domainCommits, (d) => d.datetime)).nice();

  const [minLines, maxLines] = d3.extent(domainCommits, (d) => d.totalLines) || [0, 0];
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

  const xAxis = d3.axisBottom(xScale);

  const xAxisGroup = svg.select('.x-axis');
  xAxisGroup.selectAll('*').remove();
  xAxisGroup.call(xAxis);

  const dots = svg.select('g.dots');
  const sortedCommits = d3.sort(currentCommits, (d) => -d.totalLines);

  dots
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .style('--r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });
}