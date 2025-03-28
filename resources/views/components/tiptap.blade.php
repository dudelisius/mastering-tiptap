<div
    x-data="tiptap($wire.entangle('{{ $attributes->wire('model')->value() }}'), $wire)"
    wire:ignore
    {{ $attributes->whereDoesntStartWith('wire:model') }}
>
    <div x-ref="toolbar" class="mb-2">
        <x-tiptap-button @click="toggleBold()" x-bind:class="{ '!bg-sky-500 !border-sky-500 !text-white' : isActive('bold', updatedAt) }">Bold</x-tiptap-button>
        <x-tiptap-button @click="insertTable()">Table</x-tiptap-button>
        <x-tiptap-button @click="insertImage()">Image</x-tiptap-button>
        <x-tiptap-button @click="setTextAlign('left')">Left Align</x-tiptap-button>
        <x-tiptap-button @click="setTextAlign('center')">Center Align</x-tiptap-button>
        <x-tiptap-button @click="setTextAlign('right')">Right Align</x-tiptap-button>
    </div>

    <div x-ref="editor" class="px-4 !py-3 border rounded border-zinc-500 focus-within:border-sky-500"></div>

    <div id="table-bubble-menu" class="flex flex-col gap-1">
        <div class="flex gap-1">
            <x-tiptap-button small @click="addColumnBefore()">Add Col Before</x-tiptap-button>
            <x-tiptap-button small @click="addColumnAfter()">Add Col After</x-tiptap-button>
            <x-tiptap-button small @click="deleteColumn()">Delete Col</x-tiptap-button>
            <x-tiptap-button small @click="addRowBefore()">Add Row Before</x-tiptap-button>
            <x-tiptap-button small @click="addRowAfter()">Add Row After</x-tiptap-button>
            <x-tiptap-button small @click="deleteRow()">Delete Row</x-tiptap-button>
        </div>
        <div class="flex gap-1">
            <x-tiptap-button small @click="toggleHeaderRow()">Toggle Header Row</x-tiptap-button>
            <x-tiptap-button small @click="toggleHeaderColumn()">Toggle Header Col</x-tiptap-button>
            <x-tiptap-button small @click="toggleHeaderCell()">Toggle Header Cell</x-tiptap-button>
            <x-tiptap-button small @click="mergeCells()">Merge Cells</x-tiptap-button>
            <x-tiptap-button small @click="splitCell()">Split Cell</x-tiptap-button>
            <x-tiptap-button small @click="deleteTable()">Delete Table</x-tiptap-button>
        </div>
    </div>
</div>
