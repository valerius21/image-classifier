import { Suspense } from "react"
import { Head, Link, usePaginatedQuery, useRouter, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getSubmissions from "app/submissions/queries/getSubmissions"

const ITEMS_PER_PAGE = 100

export const SubmissionsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ submissions, hasMore }] = usePaginatedQuery(getSubmissions, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {submissions.map((submission) => (
          <li key={submission.id}>
            <Link href={Routes.ShowSubmissionPage({ submissionId: submission.id })}>
              <a>{submission.name}</a>
            </Link>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const SubmissionsPage: BlitzPage = () => {
  return (
    <>
      <Head>
        <title>Submissions</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewSubmissionPage()}>
            <a>Create Submission</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <SubmissionsList />
        </Suspense>
      </div>
    </>
  )
}

SubmissionsPage.authenticate = true
SubmissionsPage.getLayout = (page) => <Layout>{page}</Layout>

export default SubmissionsPage
