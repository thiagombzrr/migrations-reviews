import {Context} from "probot";

export async function handlePullRequestChange (context: Context) {
    context.log("Cheguei na funcao")
    let config: any = await context.config('migrations-reviews.yml')

    if (!config) {
        context.log('%s missing configuration file', context.payload.repository.full_name)
        return
    }

    context.log("Pegando PRs")
    const pullRequest = await getPullRequest(context)
    context.log("Lendo PRs")
    const approvals = await getReviewsWithState(context, 'approved')
    const pendingReviewsCount = Math.max(0, config.reviewsUntilReady - approvals)
    const changesCount = pullRequest.additions + pullRequest.deletions
    const isReadyToMerge = (changesCount < config.changesThreshold) || (pendingReviewsCount === 0)
    const state = isReadyToMerge ? 'success' : config.notReadyState
    /*const description = isReadyToMerge ? config.readyMessage : config.notReadyMessage*/
    context.log("Enviando status: " + state)
    return context.github.repos.createStatus(context.repo({
        sha: pullRequest.head.sha,
        state: "pending",
        description: "Pending review approvals",
        context: 'probot/migrations-reviews'
    }))
}

async function getPullRequest(context: Context) {
    const response = await context.github.pulls.get({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        pull_number: context.payload.pull_request.number
    })

    return response.data
}

async function getReviewsWithState (context: Context, state: string) {
    const response = await context.github.pulls.listReviews({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        pull_number: context.payload.pull_request.number
    })

    return response.data.map(review => review.state).filter(word => word.toLowerCase() === state).length
}
