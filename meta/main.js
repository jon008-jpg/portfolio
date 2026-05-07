import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// --- 1. GLOBAL STATE ---
let data = [];
let commits = [];

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
  displayStats();
  
  // Call the new scatterplot function
  renderScatterPlot(data, commits);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

// --- 3. DATA PROCESSING ---
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
    });
}

// --- 4. UI RENDERING ---
function displayStats() {
  const container = d3.select('#stats');
  container.selectAll('*').remove();

  const numberOfFiles = d3.groups(data, (d) => d.file).length;
  const maxDepth = d3.max(data, (d) => d.depth);
  const longestLine = d3.max(data, (d) => d.length);
  const maxLines = d3.max(data, (d) => d.line);

  const dl = container.append('dl').attr('class', 'stats');

  const statsToShow = [
    { label: 'Commits', value: commits.length },
    { label: 'Files', value: numberOfFiles },
    { label: 'Total <abbr title="Lines of Code">LOC</abbr>', value: data.length, isHtml: true },
    { label: 'Max Depth', value: maxDepth },
    { label: 'Longest Line', value: longestLine },
    { label: 'Max Lines', value: maxLines },
  ];

  statsToShow.forEach(stat => {
    const group = dl.append('div').attr('class', 'stat-pair');
    
    if (stat.isHtml) {
      group.append('dt').html(stat.label);
    } else {
      group.append('dt').text(stat.label);
    }
    
    group.append('dd').text(stat.value);
  });
}

// --- 5. SCATTERPLOT RENDERING ---
function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  // X-Scale: Dates/Time
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  // Y-Scale: 24-hour clock (0 at bottom, 24 at top)
  const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7); // Better visibility for overlapping commits
}