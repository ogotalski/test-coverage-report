const fs = require("fs");
const {log} = require("./log");

function parseCounter(fileName, packageName, lines) {
    const file = {}
    file.name = fileName;
    file.path = `${packageName}/${fileName}`
    file.package = replaceSlash(packageName)
    file.lines = new Map(lines.map(line=>[line.number,line]))
    let missed = 0
    let covered = 0
    lines.forEach((line) => {
        missed += line.mi;
        covered += line.ci;
    });
    file.missed = missed;
    file.covered = covered;
    file.percentage = parseFloat(
        ((file.covered / (file.covered + file.missed)) * 100).toFixed(2)
    );
    return file;
}

function merge(file, old) {
    file.missed += old.missed;
    file.covered += old.covered;
    file.percentage = parseFloat(
        ((file.covered / (file.covered + file.missed)) * 100).toFixed(2)
    );
}


function parseReports(reports) {
    const packages = [].concat(...reports.map((report) => report["report"]).map((report) => report["package"]))
    const result = {};
    const resultFiles = [];
    packages.forEach((item) => {
        const packageName = item["$"].name;
        const sourceFiles = item.sourcefile;
        sourceFiles.forEach((sourceFile) => {
            const fileName = sourceFile["$"].name;
            const lines = sourceFile["line"];
            const fileLines =[]
            if (lines)
                lines.forEach((l)=>{
                    const line = l["$"]
                    const fileLine = {}
                    fileLine.number = parseInt(line["nr"]);
                    fileLine.mi = parseInt(line["mi"]);
                    fileLine.ci = parseInt(line["ci"]);
                    fileLine.mb = parseInt(line["mb"]);
                    fileLine.cb = parseInt(line["cb"]);
                    fileLines.push(fileLine)
                })
            const file = parseCounter(fileName, packageName, fileLines);
            resultFiles.push(file);
        });
    });
    result.files = resultFiles
    if (result.files.length != 0) {
        result.files.sort((a, b) => b.percentage - a.percentage);
        result.percentage = getTotalPercentage(result.files);
    } else {
        result.percentage = 100;
    }
    return result;
}

function fileExists(filePath) {
    return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
}


function addSources(reports, sourcePaths) {
    reports.files.map((report) => {
        sourcePaths.forEach((sourcePath) => {
            let filePath = `${sourcePath}/${report.path}`;

            let fileExists1 = fileExists(filePath);
            log(`file: ${filePath} - ${fileExists1}`)
            if (fileExists1) {
                report.source = fs.readFileSync(filePath, "utf8")
            }
        })
    })
    return reports
}


function getTotalPercentage(files) {
    var missed = 0;
    var covered = 0;
    files.forEach((file) => {
        missed += file.missed;
        covered += file.covered;
    });
    return parseFloat(((covered / (covered + missed)) * 100).toFixed(2));
}


function replaceSlash(str) {
    return str.replace(/\//g, ".");
}

function getPRCoverageReport(files, prFiles) {
    const result = {}
    result.files = files.map((file) => {
        const prFile = prFiles.find(function (f) {
            return f.filePath.endsWith(file.path);
        });
        if (prFile != null) file.url = prFile.url
        return file
    }).filter(file => file.url !== undefined)
    result.percentage = getTotalPercentage(result.files)
    return result;
}

module.exports = {
    parseReports,
    getPRCoverageReport,
    addSources: addSources
};