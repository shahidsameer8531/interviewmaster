import { AppShell } from "@/components/app/AppShell";

/**
 * Prep Room, the signed-in app. No marketing chrome. The shell variant
 * (sidebar, rail or focus) is chosen from the pathname inside AppShell.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
