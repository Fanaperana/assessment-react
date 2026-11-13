<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(): Response { return Inertia::render('admin/index', ['users' => User::orderBy('name')->paginate(20), 'categories' => Category::orderBy('name')->get()]); }
    public function updateUser(UpdateUserRoleRequest $request, User $user): RedirectResponse { $user->update($request->validated()); return back()->with('success', 'User role updated.'); }
    public function storeCategory(StoreCategoryRequest $request): RedirectResponse { $data = $request->validated(); Category::create(['name' => $data['name'], 'slug' => str($data['name'])->slug()]); return back()->with('success', 'Category created.'); }
}
