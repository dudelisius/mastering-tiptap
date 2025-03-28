<?php

declare(strict_types=1);

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithFileUploads;
use Illuminate\Foundation\Inspiring;
use Livewire\Attributes\Validate;

class Welcome extends Component
{
    use WithFileUploads;

    public string $body = 'Hello world! :-)';
    public string $output = '';

    #[Validate('required|image|max:500')]
    public $image;

    public function setQuote()
    {
        $this->body = str(Inspiring::quote())->stripTags()->replace(["\r", "\n"], '')->value;
    }

    public function save()
    {
        $this->output = $this->body;
    }

    public function imageUpload()
    {
        try {
            $this->validate();
        } catch (\Illuminate\Validation\ValidationException $e) {
            return ['errors' => $e->errors()];
        }

        $fileInfo = pathinfo($this->image->getClientOriginalName());
        $uniqueName = (string) str()->uuid() . '.' . $fileInfo['extension'];

        $this->image->storeAs('uploads', $uniqueName, 'public');

        return [
            'originalFileName' => $fileInfo['filename'],
            'fileName' => $uniqueName,
            'src' => asset('uploads/' . $uniqueName)
        ];
    }
}
