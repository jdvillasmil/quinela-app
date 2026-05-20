import LoginForm from './LoginForm'

interface Props {
  searchParams: { error?: string }
}

export default function LoginPage({ searchParams }: Props) {
  return <LoginForm urlError={searchParams.error} />
}
