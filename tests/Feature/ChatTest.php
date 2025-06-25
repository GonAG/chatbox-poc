<?php

use App\\Models\\Conversation;
use App\\Models\\User;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to login when visiting chat', function () {
    $this->get('/chat')->assertRedirect('/login');
});

test('authenticated users can view chat page', function () {
    $user = User::factory()->create();
    Conversation::factory()->for($user)->create();

    $this->actingAs($user)->get('/chat')->assertOk();
});

test('api routes are auth protected', function () {
    $user = User::factory()->create();
    $conversation = Conversation::factory()->for($user)->create();

    $this->getJson('/api/conversations')->assertUnauthorized();
    $this->actingAs($user)->getJson('/api/conversations')->assertOk();
    $this->actingAs($user)->getJson('/api/conversations/'.$conversation->id)->assertOk();
});

test('authenticated users can send messages', function () {
    $user = User::factory()->create();
    $conversation = Conversation::factory()->for($user)->create();

    $this->actingAs($user)
        ->postJson('/api/conversations/'.$conversation->id.'/messages', [
            'content' => 'Hello',
        ])
        ->assertCreated()
        ->assertJsonPath('content', 'Hello');
});

