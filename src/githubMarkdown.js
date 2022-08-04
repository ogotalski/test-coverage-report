function createCommentTitle(title) {
    if (title != null && title.length > 0) {
        return "### " + title + `\n`;
    } else {
        return "";
    }
}

function createTotalPercentagePart(fullReport, masterReport) {
    let masterCoverage = masterReport && masterReport.files.length > 0 ? `${masterReport.percentage}% in master` : "";
    return `#### :open_file_folder: ${fullReport.percentage}% of the overall code covered by tests. ${masterCoverage}`;
}

function createPRReportPart(prReport, masterReport) {

    if (prReport.files.length == 0)
        return "No files that require code coverage in this PR"

    const masterFiles = new Map(masterReport.files.map(file => [file.path, file]))

    return `#### :inbox_tray: ${prReport.percentage}% of the files changed in pull request covered by tests.\n` +
        `##### Details:\n` +
        prReport.files.map((file) => {
            const masterCoverage = masterFiles.has(file.path) ? ` (${masterFiles.get(file.path).percentage}%)` : ""
            let spoiler = file.source ? renderCoverageDetails(file) : ""
            let header = `<kbd>${file.package}.<b>${file.name}</b></kbd> - <b>${file.percentage}%</b> ${masterCoverage}`
            let footer = `[${file.package}.${file.name}](${file.url})`
            let summary = `<details><summary>${header}</summary>\n\n${spoiler}\n${footer}\n\n<hr/></details>\n\n`
            return summary
        }).join("")
}

function renderLine(index, array, filelines, line) {
    let number = " " + pad(index + 1, array.length.toString().length)
    let status = "#"
    const fileLine = filelines.get(index + 1)
    if (fileLine) {

        if (fileLine.mi === 0 && fileLine.mb === 0) status = "+"
        else if (fileLine.ci != 0 || fileLine.cb != 0) status = "!"
        else status = "-"
    }
    return `${status}${number}: ${line}`
}

function renderCoverageDetails(file) {
    const content = file.source.split("\n").map((line, index, array) => {
        return renderLine(index, array, file.lines, line);
    }).join("\n");

    return "```diff\n" + content + "\n```"
}


function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

const offset = 4;

function createParts(file) {
    const parts = []
    Array.from(file.lines.keys()).sort(function (a, b) {
        return a - b;
    }).forEach(line => {
        let part = parts.at(-1)
        if (part && part.end >= line) {
            part.end = line + offset
        } else
            part = null
        if (!part) {
            part = {}
            part.start = line - offset > 0 ? line - offset : 0
            part.end = line + offset
            parts.push(part)
        }
    })
    return parts
}

function renderPart(part, fileSource, fileLines) {
    const content = fileSource.split("\n").map((line, index, array) => {
        if (index + 1 >= part.start && index + 1 <= part.end)
            return renderLine(index, array, fileLines, line);
        else
            return null
    }).filter(line => line).join("\n");

    return "```diff\n" + content + "\n```"
}

function renderPartWithMaster(part, file) {
    let end = pad(part.end +1 , (part.end+1).toString().length)
    let start = pad(part.start +1 , (part.end+1).toString().length)
    const header = `\n <b>Pull Request:</b> <kbd><b>${file.name}#L${start}-${end}</b></kbd>\n\n${renderPart(part, file.source, file.lines)}`
    const spoiler = `<b>Master:</b> <kbd><b>${file.name}#L${start}-${end}</b></kbd>\n ${renderPart(part,file.source,file.masterLines)}`
    return `<details><summary>${header}\n</summary>\n\n${spoiler}\n</details>\n\n`
}

function renderDecrease(file) {

    const masterCoverage = ` (${file.masterPercentage}%)`
    let parts = createParts(file);
    let spoiler = file.source ? "<dl>" + parts.map(part => renderPartWithMaster(part, file)).
        map(part=> `<dd> ${part} </dd>`).join("\n") + "</dl>": ""
    let header = `<kbd>${file.package}.<b>${file.name}</b></kbd> - <b>${file.percentage}%</b> ${masterCoverage}`
    let footer = file.url ? `[${file.package}.${file.name}](${file.url})` : ""
    return `<details><summary>${header}</summary>\n\n${spoiler}\n${footer}\n\n<hr/></details>\n\n`
}

function createDecreasePart(prMasterDecreaseReport) {
    if (prMasterDecreaseReport.files.length == 0)
        return ""
    const files = prMasterDecreaseReport.files.map(file => renderDecrease(file)).join("\n")
    return `<hr/>\n\n### :rotating_light: Code coverage decrease for files outside Pull Request\n ##### Details:\n ${files}\n`;
}

function createCommentBody(title, fullReport, prReport, masterReport, prMasterDecreaseReport) {
    const header = createCommentTitle(title)
    const totalPercentagePart = createTotalPercentagePart(fullReport, masterReport)
    const prReportPart = createPRReportPart(prReport, masterReport)
    const decreasePart = createDecreasePart(prMasterDecreaseReport)
    return `${header}\n${totalPercentagePart}\n${prReportPart}${decreasePart}`
}

module.exports = {
    createCommentTitle,
    createCommentBody
}