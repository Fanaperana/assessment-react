@component('mail::message')
# New ticket

Ticket **#{{ $ticket->id }}** — {{ $ticket->subject }} was created.

@component('mail::button', ['url' => url('/tickets/'.$ticket->id)])
Open ticket
@endcomponent
@endcomponent
