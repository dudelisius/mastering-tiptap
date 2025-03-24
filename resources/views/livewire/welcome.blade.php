<div>
    <form wire:submit.prevent="save">
        
        <x-tiptap wire:model="body"></x-tiptap>

        <div class="flex justify-end gap-2 pt-6 mt-6 border-t border-zinc-300">
            <button type="button" wire:click="setQuote" class="px-3 py-1 transition border rounded cursor-pointer text-zinc-400 border-zinc-400 hover:bg-zinc-100 hover:text-zinc-500">Update Body</button>
            <button class="px-3 py-1 transition border rounded cursor-pointer text-zinc-400 border-zinc-400 hover:bg-zinc-100 hover:text-zinc-500">Save Body</button>
        </div>
    </form>

    @if ($output)
        <div>
            <label class="block py-2 text-zinc-400">Output:</label>
            <div class="px-4 py-3 border rounded border-zinc-400 text-zinc-400">{{ $output }}</div>
        </div>
    @endif

</div>
