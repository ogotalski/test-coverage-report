const fs = require('fs')
const AdmZip = require('adm-zip')
const filesize = require('filesize')
const pathname = require('path')

const { log } = require('./log')

async function downloadArtifact (client, owner, repo, path, name, branch, workflow) {
  try {
    const workflowConclusion = 'success'

    log('owner', owner)
    log('repo', repo)
    log('artifact name', name)
    log('download path', path)
    log('workflow', workflow)

    if (branch) {
      branch = branch.replace(/^refs\/heads\//, '')
      log('artifact branch', branch)
    }
    let runID = null

    for await (const runs of client.paginate.iterator(client.rest.actions.listWorkflowRuns, {
      owner,
      repo,
      workflow_id: workflow,
      ...(branch ? { branch } : {})
    }
    )) {
      for (const run of runs.data) {
        log('run', run)
        if (workflowConclusion && workflowConclusion !== run.conclusion) {
          continue
        }
        runID = run.id
        break
      }
      if (runID) {
        break
      }
    }
    log('Run ID', runID)
    if (!runID) {
      throw new Error('no matching workflow run found')
    }

    const artifacts = await client.paginate(client.rest.actions.listWorkflowRunArtifacts, {
      owner,
      repo,
      run_id: runID
    })
    for (const artifact of artifacts) {
      log('artifact', artifact.name)
    }
    const filtered = artifacts.filter((artifact) => {
      return artifact.name === name
    })
    if (filtered.length === 0) {
      throw new Error('no artifacts found')
    }
    for (const artifact of filtered) {
      log('artifact', artifact.id)
      const size = filesize(artifact.size_in_bytes, { base: 10 })
      log('downloading', `${artifact.name}.zip (${size})`)
      const zip = await client.rest.actions.downloadArtifact({
        owner,
        repo,
        artifact_id: artifact.id,
        archive_format: 'zip'
      })
      fs.mkdirSync(path, { recursive: true })
      const adm = new AdmZip(Buffer.from(zip.data))
      adm.getEntries().forEach((entry) => {
        const action = entry.isDirectory ? 'creating' : 'inflating'
        const filepath = pathname.join(path, entry.entryName)

        log(` ${action}`, filepath)
      })
      adm.extractAllTo(path, true)
    }
  } catch (error) {
    log('Error', error.message)
  }
}

module.exports = {
  downloadArtifact
}
