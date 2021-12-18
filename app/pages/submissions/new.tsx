import { Link, useRouter, useMutation, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import createSubmission from "app/submissions/mutations/createSubmission"
import { SubmissionForm, FORM_ERROR } from "app/submissions/components/SubmissionForm"

const NewSubmissionPage: BlitzPage = () => {
  const router = useRouter()
  const [createSubmissionMutation] = useMutation(createSubmission)

  return (
    <div>
      <h1>Create New Submission</h1>

      <SubmissionForm
        submitText="Create Submission"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateSubmission}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const submission = await createSubmissionMutation(values)
            router.push(Routes.ShowSubmissionPage({ submissionId: submission.id }))
          } catch (error: any) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />

      <p>
        <Link href={Routes.SubmissionsPage()}>
          <a>Submissions</a>
        </Link>
      </p>
    </div>
  )
}

NewSubmissionPage.authenticate = true
NewSubmissionPage.getLayout = (page) => <Layout title={"Create New Submission"}>{page}</Layout>

export default NewSubmissionPage
