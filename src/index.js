const core = require('@actions/core')
const action = require('./action')

action.run().catch(error => {
  core.setFailed(error.message)
})
