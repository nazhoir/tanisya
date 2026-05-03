import { ShieldAlertIcon, LogOutIcon } from "lucide-react"

import { Button } from "@tanisya/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@tanisya/ui/components/empty"

export function NotAdmin() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldAlertIcon className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>Akses Ditolak</EmptyTitle>
        <EmptyDescription>
          Anda tidak diperkenankan mengakses halaman ini. Halaman ini memerlukan hak akses khusus. Silakan coba ganti akun Anda.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button>
          <LogOutIcon className="mr-2 h-4 w-4" />
          Ganti Akun
        </Button>
        <Button variant="outline" asChild>
          <a href="/">Kembali ke Beranda</a>
        </Button>
      </EmptyContent>
    </Empty>
  )
}