const variables = {};
const elements = {
  commandLine() {
    return document.querySelector('input[name="input-line"]');
  },
  clearButton() {
    return document.querySelector('button.clear-btn');
  },
  terminalOutput() {
    return document.querySelector('.terminal-output');
  },
  terminalBox() {
    return document.querySelector('.terminal-box');
  },
};

const abdielbr = {
  arguments: [
    ['help', 'Display help'],
    ['github', 'Fetch and display GitHub repository list'],
    ['about', 'Display personal information'],
    ['work', 'Past and current work'],
  ],
  exec(args) {
    const match = this.arguments.find((arg) =>
      args[0] === `--${arg[0]}` || args[0] === `-${arg[0][0]}`,
    );

    if (!match) {
      return `<div class="error">Unrecognized argument "${args[0]}"</div>`;
    }

    return this[match[0]](args.slice(1));
  },
  help() {
    const spaces = (count) => Array(count).fill('&nbsp;').join('');
    return this.arguments.map(([arg, help]) => {
      const argOptions = `-${arg[0]}, --${arg}`;
      return `<div>${argOptions}${spaces(18 - argOptions.length)}${help}</div>`;
    }).join('\n');
  },
  async github() {
    const response = await fetch('https://api.github.com/users/abdielbrilhante/repos');
    const data = await response.json();
    return data.filter((repo) => !repo.fork).map((repo) => `
      <div class="repo">
        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
        ${repo.language ? `<span>[${repo.language.toLowerCase()}]</span>` : ''}
        ${repo.description ? `<div>&nbsp;&nbsp;${repo.description}</div>` : ''}
      </div>
      <br>
    `).join('\n');
  },
  about() {
    return `
      Abdiel Brilhante Soares<br>
      ──────────────<br>
      Hi, I'm a web developer based in Fortaleza, Brasil.<br><br>
      I have a background in Computer Science and have been working with<br>
      frontend and backend development for a few years, and I'm currently<br>
      a senior frontend developer @ Oowlish.
    `;
  },
  work() {
    return `
      <div class="work-item">Late 2018 - Present [Oowlish]</div>
        Full-time senior frontend developer<br>
        Working with (SSR) React, GraphQL, Node and Python<br>
      <br>
      <div class="work-item">2017 - 2018 [Avant SD]</div>
        Frontend developer<br>
        Working in React, Vue.js and Angular projects<br>
    `;
  },
};

const commands = {
  data: [],
  cursor: 0,
  previous() {
    this.cursor = !this.cursor ? this.data.length - 1 : this.cursor - 1;
    return this.data[this.cursor];
  },
  next() {
    this.cursor = !this.cursor ? this.data.length - 1 : this.cursor - 1;
    return this.data[this.cursor];
  },
  push(command) {
    this.cursor = 0;
    const index = this.data.indexOf(command);
    if (index >= 0) {
      this.data = [...this.data.slice(0, index), ...this.data.slice(index), command];
    } else {
      this.data = [...this.data, command];
    }
  },
};

const programs = {
  export(args) {
    const [variable, value] = args;
    if (variable) {
      variables[`$${variable}`] = value || '';
    }
  },
  echo(args) {
    return args.map((arg) => arg.startsWith('$') ? variables[arg] : arg).join(' ');
  },
  abdielbr(args) {
    return abdielbr.exec(args);
  },
};

function execProgram(command) {
  const [program, ...args] = command.split(' ');
  if (!programs[program]) {
    return `<div class="error">${program}: command not found</div>`;
  }

  return programs[program](args) || '';
}

async function handleInput(event) {
  if (event.key === 'ArrowUp') {
    event.target.value = commands.previous();
    return;
  }

  if (event.key === 'ArrowDown') {
    event.target.value = commands.next();
    return;
  }

  if (event.key.toLowerCase() === 'k' && event.ctrlKey && event.shiftKey) {
    const terminalOutput = elements.terminalOutput();
    terminalOutput.innerHTML = '';
    return;
  }

  const command = event.target.value;
  if (command && event.key === 'Enter') {
    commands.push(command);
    const output = await execProgram(command);
    const terminalOutput = elements.terminalOutput();
    terminalOutput.innerHTML = `
      ${terminalOutput.innerHTML}
      <div><span class="prompt">$ ></span> ${command}</div>
      ${output}
    `;

    // Clear command line
    event.target.value = '';

    // Scroll to bottom
    const terminalBox = elements.terminalBox();
    terminalBox.scrollTo(0, terminalBox.scrollHeight);
  }
}

function ghostWrite(command, index = 0) {
  const commandLine = elements.commandLine();

  if (index === command.length) {
    commandLine.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
  } else if (index < command.length) {
    commandLine.value += command[index];
    commandLine.dispatchEvent(new KeyboardEvent('keyup', { key: command[index], bubbles: true }));
    setTimeout(() => ghostWrite(command, index + 1), 150 - Math.round(Math.random() * 20));
  }
}

document.addEventListener('DOMContentLoaded', main);

function main() {
  const commandLine = elements.commandLine();
  commandLine.focus();
  commandLine.addEventListener('keyup', handleInput);
  commandLine.addEventListener('blur', () => commandLine.focus());

  const clearButton = elements.clearButton();
  clearButton.addEventListener('click', () => {
    const terminalOutput = elements.terminalOutput();
    terminalOutput.innerHTML = '';
  });

  ghostWrite('abdielbr --help');
}
