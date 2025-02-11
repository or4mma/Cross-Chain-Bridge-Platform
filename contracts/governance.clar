;; Governance Contract

;; Define data structures
(define-map proposals
  { proposal-id: uint }
  {
    description: (string-utf8 256),
    votes-for: uint,
    votes-against: uint,
    end-block: uint,
    executed: bool
  }
)

(define-map votes
  { proposal-id: uint, voter: principal }
  bool
)

(define-data-var next-proposal-id uint u0)

;; Error codes
(define-constant err-unauthorized (err u100))
(define-constant err-already-voted (err u101))
(define-constant err-voting-ended (err u102))
(define-constant err-already-executed (err u103))

;; Functions
(define-public (create-proposal (description (string-utf8 256)) (voting-period uint))
  (let
    ((proposal-id (var-get next-proposal-id)))
    (map-set proposals
      { proposal-id: proposal-id }
      {
        description: description,
        votes-for: u0,
        votes-against: u0,
        end-block: (+ block-height voting-period),
        executed: false
      }
    )
    (var-set next-proposal-id (+ proposal-id u1))
    (ok proposal-id)
  )
)

(define-public (vote (proposal-id uint) (vote-for bool))
  (let
    ((proposal (unwrap! (map-get? proposals { proposal-id: proposal-id }) err-unauthorized)))
    (asserts! (< block-height (get end-block proposal)) err-voting-ended)
    (asserts! (is-none (map-get? votes { proposal-id: proposal-id, voter: tx-sender })) err-already-voted)
    (map-set votes { proposal-id: proposal-id, voter: tx-sender } vote-for)
    (if vote-for
      (map-set proposals { proposal-id: proposal-id }
        (merge proposal { votes-for: (+ (get votes-for proposal) u1) }))
      (map-set proposals { proposal-id: proposal-id }
        (merge proposal { votes-against: (+ (get votes-against proposal) u1) }))
    )
    (ok true)
  )
)

(define-public (execute-proposal (proposal-id uint))
  (let
    ((proposal (unwrap! (map-get? proposals { proposal-id: proposal-id }) err-unauthorized)))
    (asserts! (>= block-height (get end-block proposal)) err-voting-ended)
    (asserts! (not (get executed proposal)) err-already-executed)
    (if (> (get votes-for proposal) (get votes-against proposal))
      (begin
        (map-set proposals { proposal-id: proposal-id }
          (merge proposal { executed: true }))
        (ok true)
      )
      (err u104) ;; Proposal rejected
    )
  )
)

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals { proposal-id: proposal-id })
)

