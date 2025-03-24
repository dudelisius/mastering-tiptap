<div
    x-data="tiptap($wire.entangle('{{ $attributes->wire('model')->value() }}'))"
    wire:ignore
    {{ $attributes->whereDoesntStartWith('wire:model') }}
>
    <div x-ref="toolbar" class="mb-2">
        <x-tiptap-button @click="toggleBold()" x-bind:class="{ '!bg-sky-500 !border-sky-500 !text-white' : isActive('bold', updatedAt) }">Bold</x-tiptap-button>
    </div>

    <div x-ref="editor" class="px-4 py-3 border rounded border-zinc-500 text-zinc-500 focus-within:border-sky-500"></div>
</div>
