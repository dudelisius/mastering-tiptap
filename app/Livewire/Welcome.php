<?php

declare(strict_types=1);

namespace App\Livewire;

use App\Models\Page;
use Livewire\Component;
use Livewire\WithFileUploads;
use Livewire\Attributes\Validate;
use Illuminate\Foundation\Inspiring;

class Welcome extends Component
{
    use WithFileUploads;

    public string $body = 'Hello world! :-)';
    public string $output = '';

    #[Validate('required|image|max:500')]
    public $image;

    public Page $page;

    public function mount()
    {
        $this->page = Page::find(1)->first();

        $this->body = $this->page->body;
        $this->output = $this->page->body;
    }

    public function setQuote()
    {
        $this->body = str(Inspiring::quote())->stripTags()->replace(["\r", "\n"], '')->value;
    }

    public function save()
    {
        $this->output = $this->body;

        $this->page->update(['body' => $this->body]);
    }

    public function imageUpload()
    {
        try {
            $this->validate();
        } catch (\Illuminate\Validation\ValidationException $e) {
            return ['errors' => $e->errors()];
        }

        $this->page->addMedia($this->image)->toMediaCollection();

        return [
            'src' => $this->page->getFirstMediaUrl()
        ];
    }
}
