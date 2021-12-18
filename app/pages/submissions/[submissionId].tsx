import { Suspense } from "react"
import { Head, Link, useRouter, useQuery, useParam, BlitzPage, useMutation, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getSubmission from "app/submissions/queries/getSubmission"
import deleteSubmission from "app/submissions/mutations/deleteSubmission"

export const Submission = () => {
  const router = useRouter()
  const submissionId = useParam("submissionId", "number")
  const [deleteSubmissionMutation] = useMutation(deleteSubmission)
  const [submission] = useQuery(getSubmission, { id: submissionId })

  return (
    <>
      <Head>
        <title>Submission {submission.id}</title>
      </Head>

      <div>
        <h1>Submission {submission.id}</h1>
        <pre>{JSON.stringify(submission, null, 2)}</pre>

        <Link href={Routes.EditSubmissionPage({ submissionId: submission.id })}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteSubmissionMutation({ id: submission.id })
              router.push(Routes.SubmissionsPage())
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  )
}

const ShowSubmissionPage: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.SubmissionsPage()}>
          <a>Submissions</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Submission />
      </Suspense>
    </div>
  )
}

ShowSubmissionPage.authenticate = true
ShowSubmissionPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowSubmissionPage
