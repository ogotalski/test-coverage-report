
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
    if (prReport.files.length ==0)
        return "No files that require code coverage in this PR"
    return `#### :inbox_tray: ${prReport.percentage}% of the files changed in pr covered by tests.\n` +
        `---\n ##### Details:\n` +
        prReport.files.map((file) => {
            let spoiler = file.source ? renderCoverageDetails(file) : ""
            let header = `${file.package}.<b>${file.name}</b> - <b>${file.percentage}%</b>`
            let footer = `[${file.package}.${file.name}](${file.url})`
            let summary = `<details><summary>${header}</summary>\n\n${spoiler}\n${footer}\n\n<hr/></details>\n\n`
            return summary
        }).join("")
}

function renderCoverageDetails(file) {
    const content = file.source.split("\n").map((line, index, array) => {
        let number = " " + pad(index + 1, array.length.toString().length)
        let status = "#"
        const fileLine = file.lines.get(index + 1)
        if (fileLine){

            if (fileLine.mi === 0 && fileLine.mb === 0) status = "+"
            else if (fileLine.ci != 0 || fileLine.cb != 0) status = "!"
            else status = "-"
        }
        return `${status}${number}: ${line}`
    }).join("\n");

    return "```diff\n" + content + "\n```"
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