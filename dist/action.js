const core = require('@actions/core');
const github = require("@actions/github");
const fs = require("fs");
const xml2js = require("xml2js");
const {parseBooleans} = require("xml2js/lib/processors");
const parser = require("./parseReport")
const githubMarkdown = require("./githubMarkdown")

const debug = parseBooleans(core.getInput("debug"));

function log(title, message){
  if (debug) core.info(`${title}: ${JSON.stringify(message, " ", 4)}`)
}

async function run() {
  try {
    const paths = core.getInput("paths").split(",");
    const htmlReportsPaths = core.getInput("htmlReports").split(",");
    const title = core.getInput("title");
    const updateComment = parseBooleans(core.getInput("update-comment"));
    const event = github.context.eventName;

    log("reportPaths", paths);
    log("htmlReports", htmlReportsPaths);

    log("Event", event);

    const pr = getPr(event)
    const client = github.getOctokit(core.getInput("token"));

    const changedFilesAsync = getChangedFiles(pr, client);

    let reports = await getReports(paths);
    log("reports",  reports)
    const fullReport = parser.parseReports(reports)
    log("overallCoverage", fullReport.percentage)
    const prReport = parser.addHtmlReports(parser.getPRCoverageReport(fullReport.files, await changedFilesAsync), htmlReportsPaths);
    log("PR Coverage" ,prReport);

    if (pr != null) {
      await postComment(
          pr.number,
          updateComment,
          githubMarkdown.createCommentTitle(title),
          githubMarkdown.createCommentBody(fullReport,prReport),
          client
      );
    }
  } catch (error) {
    core.setFailed(error);
  }
}

function getPr(event)
{
  const pr= {};
  switch (event) {
    case "pull_request":
    case "pull_request_target":
      let pullRequest = github.context.payload.pull_request;
      log("pullRequest", pullRequest)
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
  return Promise.all(
      xmlPaths.map(async (xmlPath) => {
        const reportXml = await fs.promises.readFile(xmlPath.trim(), "utf-8");
        return await xml2js.parseStringPromise(reportXml);
      })
  );
}

async function getChangedFiles(pr, client) {
  const response = await client.repos.compareCommits({
    base: pr.base,
    head: pr.head,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });
  log("compareCommits response", response)
  var changedFiles = [];
  response.data.files.forEach((file) => {
    var changedFile = {
      filePath: file.filename,
      url: file.blob_url,
    };
    changedFiles.push(changedFile);
  });
  log ("changedFiles", changedFiles);
  return changedFiles;
}



async function postComment(number, update, title, body, client) {
  let commentUpdated = false;

  if (update && title) {
    const comments = await client.issues.listComments({
      issue_number: number,
      ...github.context.repo,
    });
    const comment = comments.data.find((comment) =>
        comment.body.startsWith(title),
    );

    if (comment) {
      await client.issues.updateComment({
        comment_id: comment.id,
        body: body,
        ...github.context.repo,
      });
      commentUpdated = true;
    }
  }

  if (!commentUpdated) {
    await client.issues.createComment({
      issue_number: number,
      body: body,
      ...github.context.repo,
    });
  }
}


module.exports = {
  run
}
