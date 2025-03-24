@php $title = 'Mastering Tiptap - Installing Tiptap' @endphp

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="flex justify-center bg-zinc-100">
    <div class="p-6 mt-12 bg-white shadow-xl w-2xl rounded-xl">
        <h1 class="mb-8 text-xl font-medium">{{ $title }}</h1>
       {{ $slot }}
    </div>
</body>

</html>
