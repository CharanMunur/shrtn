import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { QrCode } from "lucide-react"

interface QrCodeDialogProps {
  isOpen: boolean
  onClose: () => void
  qrCodeUrl: string | null
  qrCodeCode: string
  onDownload: () => void
}

export function QrCodeDialog({ isOpen, onClose, qrCodeUrl, qrCodeCode, onDownload }: QrCodeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-xs p-5 rounded-sm">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <QrCode className="h-5 w-5 text-primary" />
            Link QR Code
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Scan the QR code to visit: <code className="text-primary font-mono font-bold">/{qrCodeCode}</code>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4 bg-muted/20 rounded-sm border border-border/55 my-2">
          {qrCodeUrl && (
            <img
              src={`${qrCodeUrl}?format=qr`}
              alt={`QR Code for /${qrCodeCode}`}
              className="h-44 w-44 bg-white p-2 border border-border shadow-xs"
            />
          )}
        </div>
        <DialogFooter className="flex gap-2 sm:justify-between pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-sm w-full sm:w-auto text-xs cursor-pointer">
            Close
          </Button>
          <Button size="sm" onClick={onDownload} className="rounded-sm w-full sm:w-auto text-xs cursor-pointer flex items-center justify-center gap-1.5">
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
