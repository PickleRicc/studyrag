import ResetPassword from '../../components/Auth/ResetPassword';
import Head from 'next/head';

export default function ResetPasswordPage() {
    return (
        <>
            <Head>
                <title>Reset Password - StudyRag</title>
                <meta name="description" content="Reset your StudyRag account password" />
            </Head>
            <ResetPassword />
        </>
    );
}
