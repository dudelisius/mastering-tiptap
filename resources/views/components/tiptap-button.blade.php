<button
    type="button"
    {{ $attributes }}
    @class([
        'px-2 py-1 transition border rounded cursor-pointer  hover:bg-sky-100 hover:border-sky-500 hover:text-sky-500',
        'border-zinc-500 text-zinc-500' => !$attributes->has('small'),
        'text-xs border-zinc-200' => $attributes->has('small'),
    ])
>{{ $slot }}</button>
