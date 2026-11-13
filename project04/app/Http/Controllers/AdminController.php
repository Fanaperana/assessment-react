<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(): Response { return Inertia::render('admin/index', ['users' => User::orderBy('name')->paginate(20), 'categories' => Category::orderBy('name')->get()]); }
    public function updateUser(Request $request, User $user): RedirectResponse { $data = $request->validate(['role' => ['required', 'in:customer,agent,admin']]); $user->update($data); return back()->with('success', 'User role updated.'); }
    public function storeCategory(Request $request): RedirectResponse { $data = $request->validate(['name' => ['required', 'string', 'max:80']]); Category::create(['name' => $data['name'], 'slug' => str($data['name'])->slug()]); return back()->with('success', 'Category created.'); }
}
