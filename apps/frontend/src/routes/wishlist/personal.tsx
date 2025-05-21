import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/wishlist/personal')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/wishlist/personal"!</div>
}
