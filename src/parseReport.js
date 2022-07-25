const fs = require("fs");
const {log} = require("./log");

function parseCounter(fileName, packageName, attr) {
    const file = {}
    file.name = fileName;
    file.path = `${packageName}/${fileName}`
    file.package = replaceSlash(packageName)
    file.missed = parseFloat(attr["missed"]);
    file.covered = parseFloat(attr["covered"]);
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
    const resultFiles = new Map();
    packages.forEach((item) => {
        const packageName = item["$"].name;
        const sourceFiles = item.sourcefile;
        sourceFiles.forEach((sourceFile) => {
            const fileName = sourceFile["$"].name;
            const counters = sourceFile["counter"];
            if (counters)
                counters.forEach((counter) => {
                    const attr = counter["$"];
                    if (attr["type"] == "INSTRUCTION") {
                        const file = parseCounter(fileName, packageName, attr);
                        if (resultFiles.has(file.path)) {
                            merge(file, resultFiles.get(file.path))
                        }
                        resultFiles.set(file.path, file);
                    }
                })
        });
    });
    result.files = Array.from(resultFiles.values());
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


function addHtmlReports(reports, htmlReportPaths) {
    reports.files.map((report) => {
        htmlReportPaths.forEach((htmlReportPath) => {
            let filePath = `${htmlReportPath}/${report.package}/${report.name}.html`;

            let fileExists1 = fileExists(filePath);
            log(`file: ${filePath} - ${fileExists1}`)
            if (fileExists1) {
                report.htmlReport = fs.readFileSync(filePath, "utf8")
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
    addHtmlReports
};