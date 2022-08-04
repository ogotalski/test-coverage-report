const core = require('@actions/core');
const github = require("@actions/github");
const fs = require("fs");
const xml2js = require("xml2js");
const {parseBooleans} = require("xml2js/lib/processors");
const parser = require("./parseReport")
const githubMarkdown = require("./githubMarkdown")
const {log} = require("./log");

async function run() {
    try {
        const paths = core.getInput("paths").split(",");
        const sourcePaths = core.getInput("sourcePaths").split(",");
        let masterPathProperty = core.getInput("masterPaths");
        const masterPaths = masterPathProperty ? masterPathProperty.split(",") : [];
        const title = core.getInput("title");
        const updateComment = parseBooleans(core.getInput("updateComment"));
        const event = github.context.eventName;

        log("reportPaths", paths);
        log("sourcePaths", sourcePaths);
        log("masterPaths", masterPaths);
        log("title", title)
        log("updateComment", updateComment)

        log("Event", event);

        const pr = getPr(event)

        const client = github.getOctokit(core.getInput("token"));


        let changedFiles = getChangedFiles(pr, client)
        let masterReports = getReports(masterPaths);
        let reports = await getReports(paths);
        log("reports", reports)
        const fullReport = parser.parseReports(reports)
        log("overallCoverage", fullReport.percentage)

        const prReport = parser.addSources(parser.getPRCoverageReport(fullReport.files, await changedFiles), sourcePaths)
        log("PR Coverage", prReport);
        let masterReport = parser.parseReports(await masterReports)
        const prMasterDecreaseReport = parser.addSources(parser.getDecreaseReport(fullReport, prReport, masterReport), sourcePaths)
        if (pr != null) {
            await postComment(pr.number, updateComment, githubMarkdown.createCommentTitle(title), githubMarkdown.createCommentBody(title, fullReport, prReport, masterReport, prMasterDecreaseReport), client);
        }
    } catch (error) {
        core.setFailed(error);
    }
}

function getPr(event) {
    const pr = {};
    switch (event) {
        case "pull_request":
        case "pull_request_target":
            let pullRequest = github.context.payload.pull_request;
            pr.base = pullRequest.base.sha;
            pr.head = pullRequest.head.sha;
            pr.number = pullRequest.number;
            break;
        default:
            throw `Only pull requests are supported, ${github.context.eventName} not supported.`;
    }
    log("pr", pr)
    return pr
}


async function getReports(xmlPaths) {
    return Promise.all(xmlPaths.map(async (xmlPath) => {
        const reportXml = await fs.promises.readFile(xmlPath.trim(), "utf-8");
        return await xml2js.parseStringPromise(reportXml);
    }));
}

async function getChangedFiles(pr, client) {
    const req = {
        base: pr.base, head: pr.head, owner: github.context.repo.owner, repo: github.context.repo.repo,
    };
    log("compareCommits req", req)
    const response = await client.repos.compareCommits(req);
    const changedFiles = [];
    response.data.files.forEach((file) => {
        const changedFile = {
            filePath: file.filename, url: file.blob_url,
        };
        changedFiles.push(changedFile);
    });
    log("changedFiles", changedFiles);
    return changedFiles;
}


async function postComment(number, update, title, body, client) {
    let updated = false;
    if (update && title) {
        const listComments = await client.issues.listComments({
            issue_number: number, ...github.context.repo,
        });
        log("listComments", listComments)
        const comment = listComments.data.find((comment) => comment.body.startsWith(title),);
        log("comment", comment)
        if (comment) {
            await client.issues.updateComment({
                comment_id: comment.id, body: body, ...github.context.repo,
            });
            updated = true;
        }
    }

    log("commentUpdated", updated)

    if (!updated) {
        await client.issues.createComment({
            issue_number: number, body: body, ...github.context.repo,
        });
    }
}


module.exports = {
    run
}
