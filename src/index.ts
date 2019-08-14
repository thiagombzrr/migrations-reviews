import {Application} from 'probot'
import {handlePullRequestChange} from "./pull-request-change";

export = (app: Application) => {
    app.on([
        'pull_request.opened',
        'pull_request.reopened',
        'pull_request_review.submitted',
        'pull_request_review.dismissed',
        'pull_request.synchronize'
    ], async context => {
        await handlePullRequestChange(context)
    })
}
