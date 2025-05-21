import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/wishlist/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/wishlist/overview"!</div>
}
