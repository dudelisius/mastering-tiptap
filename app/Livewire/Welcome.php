<?php

declare(strict_types=1);

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Foundation\Inspiring;

class Welcome extends Component
{
    public string $body = 'Hello world! :-)';
    public string $output = '';

    public function setQuote()
    {
        $this->body = str(Inspiring::quote())->stripTags()->replace(["\r", "\n"], '')->value;
    }

    public function save()
    {
        $this->output = $this->body;
    }
}
