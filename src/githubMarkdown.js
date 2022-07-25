const jsdom = require("jsdom");
const {JSDOM} = jsdom;


function createCommentTitle(title) {
    if (title != null && title.length > 0) {
        return "### " + title + `\n`;
    } else {
        return "";
    }
}

function createTotalPercentagePart(fullReport) {
    return `#### :open_file_folder: ${fullReport.percentage}% of the overall code covered by tests.`;
}

function createPRReportPart(prReport) {
    return `#### :inbox_tray: ${prReport.percentage}% of the files changed in pr covered by tests.\n` +
        `---\n ##### Details:\n` +
        prReport.files.map((file) => {
            let spoiler = file.htmlReport ? renderCoverageDetails(file) : ""
            let header = `${file.package}.<b>${file.name}</b> - <b>${file.percentage}%</b>`
            let footer = `[${file.package}.${file.name}](${file.url})`
            let summary = `<details><summary>${header}</summary>\n\n${spoiler}\n${footer}\n\n<hr/></details>\n\n`
            return summary
        }).join("")
}

function renderCoverageDetails(file) {
    let dom = new JSDOM(file.htmlReport)
    dom.window.document.querySelectorAll("span.nc").forEach((span) => {
        span.textContent = "- " + span.textContent
    });
    dom.window.document.querySelectorAll("span.fc").forEach((span) => {
        span.textContent = "+ " + span.textContent
    });
    dom.window.document.querySelectorAll("span.pc").forEach((span) => {
        span.textContent = "!" + " " + span.textContent
    });
    let pre = dom.window.document.querySelector("pre");
    return "```diff\n" + addHash(pre.textContent) + "\n```"
}

function addHash(text) {
    return text.split("\n").map((line, index, array) => {
        let number = " " + pad(index + 1, array.length.toString().length)
        if (line.startsWith("+") || line.startsWith("-") || line.startsWith("!")) {
            return line.replace(line[0], line[0] + number + ": ");
        } else {
            return "#" + number + ": " + line;
        }
    }).join("\n");
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function createCommentBody(title, fullReport, prReport) {
    const header = createCommentTitle(title)
    const totalPercentagePart = createTotalPercentagePart(fullReport)
    const prReportPart = createPRReportPart(prReport)
    return `${header}\n${totalPercentagePart}\n${prReportPart}`
}

module.exports = {
    createCommentTitle,
    createCommentBody
}