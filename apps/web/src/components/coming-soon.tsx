import { ClockIcon, BellIcon, ArrowLeftIcon } from "lucide-react"

import { Button } from "@tanisya/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@tanisya/ui/components/empty"

export function ComingSoon() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClockIcon className="text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>Segera Hadir</EmptyTitle>
        <EmptyDescription>
          Produk ini sedang dalam tahap persiapan dan akan segera tersedia. Nantikan pembaruan dari kami dalam waktu dekat.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button>
          <BellIcon className="mr-2 h-4 w-4" />
          Ingatkan Saya
        </Button>
        <Button variant="outline" asChild>
          <a href="/">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Kembali
          </a>
        </Button>
      </EmptyContent>
    </Empty>
  )
}