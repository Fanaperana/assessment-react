<?php

namespace App\Enums;

enum Role: string
{
    case Customer = 'customer';
    case Agent = 'agent';
    case Admin = 'admin';
}
