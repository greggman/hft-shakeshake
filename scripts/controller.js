/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
"use strict";

// Start the main app logic.
requirejs(
  [ 'hft/gameclient',
    'hft/commonui',
    'hft/misc/misc',
    'hft/misc/mobilehacks',
  ], function(
    GameClient,
    CommonUI,
    Misc,
    MobileHacks) {

  function $(id) {
    return document.getElementById(id);
  }

  var g_name = "";
  var g_client;
  var g_x = 0;
  var g_y = 0;
  var g_canvas = $("c");
  var g_ctx = g_canvas.getContext("2d");

  var globals = {
    debug: true,
  };
  Misc.applyUrlSettings(globals);
  MobileHacks.fixHeightHack();

  function onScored(data) {

  };

  g_client = new GameClient();

  g_client.addEventListener('scored', onScored);

  CommonUI.setupStandardControllerUI(g_client, globals);

  var color = Misc.randCSSColor();
  g_client.sendCmd('setColor', { color: color });
  document.body.style.backgroundColor = color;

  var quantize = function(v) {
    return Math.floor(v);
  };

  var resize = function(ctx) {
    var width  = ctx.canvas.clientWidth;
    var height = ctx.canvas.clientHeight;
    if (width  != ctx.canvas.width ||
        height != ctx.canvas.height) {
      ctx.canvas.width  = width;
      ctx.canvas.height = height;
    }
  }

  var sendDeviceAcceleration = function(eventData) {
    var accel    = eventData.acceleration || eventData.accelerationIncludingGravity;
    var rot      = eventData.rotationRate || { alpha: 0, gamma: 0, beta: 0};
    var interval = eventData.interval || 1;
    var msg = {
      x: quantize(accel.x   / interval),
      y: quantize(accel.y   / interval),
      z: quantize(accel.z   / interval),
      a: quantize(rot.alpha / interval),
      b: quantize(rot.beta  / interval),
      g: quantize(rot.gamma / interval),
    };

    resize(g_ctx);
    g_ctx.clearRect(0, 0, g_ctx.canvas.width, g_ctx.canvas.height);
    g_ctx.save();
    g_ctx.translate(g_ctx.canvas.width / 2, g_ctx.canvas.height / 2);
    g_ctx.save();
    g_ctx.translate(g_x, g_y);
    g_ctx.beginPath();
    g_ctx.arc(0, 0, 10, 0, Math.PI * 2, true);
    g_ctx.fillStyle = "green";
    g_ctx.fill();
    g_ctx.restore();

    g_ctx.fillType = "red";
    g_ctx.fillRect(0, 0, msg.x, msg.y);

    g_ctx.restore();


    CommonUI.setStatus(JSON.stringify(msg));
    g_client.sendCmd('accel', msg);
  };

  if (!window.DeviceMotionEvent) {
    alert("Your device/browser does not support device orientation. Sorry");
    return;
  }

  window.addEventListener('devicemotion', sendDeviceAcceleration, false);
});


