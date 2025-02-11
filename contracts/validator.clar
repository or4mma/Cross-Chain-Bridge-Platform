;; Validator Contract

;; Define data structures
(define-map validators principal bool)
(define-data-var required-confirmations uint u3)

;; Error codes
(define-constant err-unauthorized (err u100))
(define-constant err-already-validator (err u101))
(define-constant err-not-validator (err u102))

;; Functions
(define-public (add-validator (new-validator principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) err-unauthorized)
    (asserts! (is-none (map-get? validators new-validator)) err-already-validator)
    (ok (map-set validators new-validator true))
  )
)

(define-public (remove-validator (validator principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) err-unauthorized)
    (asserts! (is-some (map-get? validators validator)) err-not-validator)
    (ok (map-delete validators validator))
  )
)

(define-read-only (is-validator (validator principal))
  (default-to false (map-get? validators validator))
)

(define-data-var admin principal tx-sender)

(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) err-unauthorized)
    (ok (var-set admin new-admin))
  )
)

(define-read-only (get-admin)
  (var-get admin)
)

(define-public (set-required-confirmations (new-required-confirmations uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) err-unauthorized)
    (ok (var-set required-confirmations new-required-confirmations))
  )
)

(define-read-only (get-required-confirmations)
  (var-get required-confirmations)
)

