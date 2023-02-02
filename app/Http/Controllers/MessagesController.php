<?php

namespace App\Http\Controllers;

use App\Lib\PusherFactory;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessagesController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }


    /**
     * getLoadLatestMessages
     *
     *
     * @param Request $request
     */
    public function getLoadLatestMessages(Request $request)
    {
        if(!$request->user_id) {
            return;
        }

        $messages = Message::where(function($query) use ($request) {
            $query->where('from_user', Auth::user()->id)->where('to_user', $request->user_id);
        })->orWhere(function ($query) use ($request) {
            $query->where('from_user', $request->user_id)->where('to_user', Auth::user()->id);
        })->orderBy('created_at', 'ASC')->limit(10)->get();

        $return = [];

        foreach ($messages as $message) {

            $return[] = view('message-line')->with('message', $message)->render();
        }


        return response()->json(['state' => 1, 'messages' => $return]);
    }
}
