import { Suspense } from "react"
import { Head, Link, useRouter, useQuery, useMutation, useParam, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getSubmission from "app/submissions/queries/getSubmission"
import updateSubmission from "app/submissions/mutations/updateSubmission"
import { SubmissionForm, FORM_ERROR } from "app/submissions/components/SubmissionForm"

export const EditSubmission = () => {
  const router = useRouter()
  const submissionId = useParam("submissionId", "number")
  const [submission, { setQueryData }] = useQuery(
    getSubmission,
    { id: submissionId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateSubmissionMutation] = useMutation(updateSubmission)

  return (
    <>
      <Head>
        <title>Edit Submission {submission.id}</title>
      </Head>

      <div>
        <h1>Edit Submission {submission.id}</h1>
        <pre>{JSON.stringify(submission, null, 2)}</pre>

        <SubmissionForm
          submitText="Update Submission"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateSubmission}
          initialValues={submission}
          onSubmit={async (values) => {
            try {
              const updated = await updateSubmissionMutation({
                id: submission.id,
                ...values,
              })
              await setQueryData(updated)
              router.push(Routes.ShowSubmissionPage({ submissionId: updated.id }))
            } catch (error: any) {
              console.error(error)
              return {
                [FORM_ERROR]: error.toString(),
              }
            }
          }}
        />
      </div>
    </>
  )
}

const EditSubmissionPage: BlitzPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditSubmission />
      </Suspense>

      <p>
        <Link href={Routes.SubmissionsPage()}>
          <a>Submissions</a>
        </Link>
      </p>
    </div>
  )
}

EditSubmissionPage.authenticate = true
EditSubmissionPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditSubmissionPage
