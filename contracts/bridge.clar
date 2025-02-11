;; Bridge Contract

;; Define fungible token for bridge
(define-fungible-token bridged-token)

;; Error codes
(define-constant err-invalid-amount (err u100))

;; Functions
(define-public (bridge-to (recipient principal) (amount uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-burn? bridged-token amount tx-sender))
    (ok true)
  )
)

(define-public (bridge-from (recipient principal) (amount uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-mint? bridged-token amount recipient))
    (ok true)
  )
)

(define-read-only (get-balance (account principal))
  (ft-get-balance bridged-token account)
)

(define-read-only (get-total-supply)
  (ft-get-supply bridged-token)
)

