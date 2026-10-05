import {
  Component,
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type ComponentProps,
  type ReactNode,
} from "react";
export function ScreenLoading() {
  return (
    <div className="panel org-stream" data-screen-loading role="status">
      Loading workspace view…
    </div>
  );
}
export class ScreenLoadBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <section className="panel org-stream" role="alert">
        <h1 tabIndex={-1}>Workspace view unavailable</h1>
        <p>
          The view could not load. Try another view from the navigation or
          reload to retry. Reload restores only your saved demo snapshot.
        </p>
        <button className="button secondary" onClick={() => location.reload()}>
          Reload workspace
        </button>
      </section>
    ) : (
      this.props.children
    );
  }
}

export function deferredScreen<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
) {
  const Screen = lazy(loader) as ComponentType<ComponentProps<T>>;
  return function DeferredScreen(props: ComponentProps<T>) {
    return (
      <ScreenLoadBoundary>
        <Suspense fallback={<ScreenLoading />}>
          {createElement(Screen, props)}
        </Suspense>
      </ScreenLoadBoundary>
    );
  };
}
