// =============================================
//  描画（ダルマのコマ・木の盤・小槌・だるま落とし演出）
// =============================================
(function () {
  const C = DG.CONFIG;
  const COLORS = {
    1: { body: '#ff4d5e', light: '#ff9aa2', dark: '#c81d3a', line: '#a3102b', mark: '#ffd84d', name: '赤' },
    2: { body: '#3f8cff', light: '#9cc6ff', dark: '#1f55d6', line: '#1540a8', mark: '#ffd84d', name: '青' }
  };
  DG.COLORS = COLORS;

  function star(ctx, cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      i ? ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
  }

  // ダルマを1つ描く（ポップ版：まんまる・ぱっちり目・ほっぺ・にっこり）
  DG.drawDaruma = function (ctx, cx, cy, r, p, opt = {}) {
    const col = COLORS[p]; if (!col) return;
    ctx.save();
    ctx.translate(cx, cy);
    if (opt.rot) ctx.rotate(opt.rot);
    if (opt.sx || opt.sy) ctx.scale(opt.sx || 1, opt.sy || 1);
    ctx.globalAlpha *= opt.alpha == null ? 1 : opt.alpha;
    const lw = Math.max(1.5, r * 0.09);
    // からだ（ふちどり付き）
    const g = ctx.createLinearGradient(0, -r, 0, r);
    g.addColorStop(0, col.light); g.addColorStop(0.35, col.body); g.addColorStop(1, col.dark);
    ctx.fillStyle = g; ctx.strokeStyle = col.line; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.ellipse(0, r * 0.03, r * 0.94, r * 0.97, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 顔（白くまるく）
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(0, -r * 0.12, r * 0.62, r * 0.52, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = col.line; ctx.lineWidth = lw * 0.6; ctx.stroke();
    // 目（ぱっちり・キラキラ）
    const eye = x => {
      ctx.fillStyle = '#22182a';
      ctx.beginPath(); ctx.ellipse(x, -r * 0.16, r * 0.13, r * 0.16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + r * 0.04, -r * 0.22, r * 0.055, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x - r * 0.04, -r * 0.1, r * 0.025, 0, Math.PI * 2); ctx.fill();
    };
    eye(-r * 0.25); eye(r * 0.25);
    // ほっぺ
    ctx.fillStyle = 'rgba(255, 120, 150, 0.55)';
    ctx.beginPath(); ctx.ellipse(-r * 0.43, r * 0.04, r * 0.12, r * 0.075, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(r * 0.43, r * 0.04, r * 0.12, r * 0.075, 0, 0, Math.PI * 2); ctx.fill();
    // にっこり口
    ctx.strokeStyle = '#22182a'; ctx.lineWidth = Math.max(1.2, r * 0.06); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, r * 0.0, r * 0.11, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    // まゆ（小さく、にこやか）
    ctx.strokeStyle = col.dark; ctx.lineWidth = Math.max(1.2, r * 0.06);
    ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.34, r * 0.1, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
    ctx.beginPath(); ctx.arc(r * 0.25, -r * 0.34, r * 0.1, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
    // おなかのマーク（赤＝星、青＝まる）… 色が見分けにくくても形で分かる
    ctx.fillStyle = col.mark; ctx.strokeStyle = col.mark;
    if (p === 1) star(ctx, 0, r * 0.62, r * 0.2);
    else { ctx.lineWidth = Math.max(1.5, r * 0.08); ctx.beginPath(); ctx.arc(0, r * 0.62, r * 0.14, 0, Math.PI * 2); ctx.stroke(); }
    // つや
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.ellipse(-r * 0.62, -r * 0.35, r * 0.09, r * 0.2, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  // 小槌
  DG.drawHammer = function (ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    ctx.fillStyle = '#8a5a2b'; ctx.fillRect(-s * 0.06, 0, s * 0.12, s * 0.8);
    const g = ctx.createLinearGradient(0, -s * 0.28, 0, s * 0.02);
    g.addColorStop(0, '#f5c469'); g.addColorStop(1, '#c98a2a');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-s * 0.42, -s * 0.28, s * 0.84, s * 0.3, s * 0.1) : ctx.rect(-s * 0.42, -s * 0.28, s * 0.84, s * 0.3); ctx.fill();
    ctx.strokeStyle = '#7a4d16'; ctx.lineWidth = s * 0.04; ctx.stroke();
    ctx.fillStyle = '#e0393e'; ctx.fillRect(-s * 0.42, -s * 0.16, s * 0.84, s * 0.06);
    ctx.restore();
  };

  class BoardView {
    constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); }
    resize(cell) {
      this.cell = cell;
      this.pad = Math.round(cell * 0.28);
      const touch = matchMedia('(pointer: coarse)').matches;
      this.side = Math.round(cell * 0.8);                  // 左の小槌の場所
      this.top = Math.round(cell * (touch ? 0.45 : 1.0));  // 上の落とす場所（スマホは予告を出さないので狭く）
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      this.w = this.side + this.pad * 2 + C.COLS * cell + Math.round(cell * 0.2);
      this.h = this.top + this.pad * 2 + C.ROWS * cell;
      this.canvas.width = Math.round(this.w * dpr); this.canvas.height = Math.round(this.h * dpr);
      this.canvas.style.width = this.w + 'px'; this.canvas.style.height = this.h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.bx = this.side + this.pad; this.by = this.top + this.pad;
    }
    cx(c) { return this.bx + (c + 0.5) * this.cell; }
    cy(r) { return this.by + (C.ROWS - r - 0.5) * this.cell; }
    colAt(px) { const c = Math.floor((px - this.bx) / this.cell); return c >= 0 && c < C.COLS ? c : -1; }

    draw(s, now) {
      const ctx = this.ctx, cell = this.cell, R = cell * 0.4;
      ctx.clearRect(0, 0, this.w, this.h);
      const game = s.game; if (!game) return;
      const fx = s.fx || {};
      // 盤（木）
      const bw = C.COLS * cell + this.pad * 2, bh = C.ROWS * cell + this.pad * 2;
      const x0 = this.side, y0 = this.top;
      const wood = ctx.createLinearGradient(x0, y0, x0 + bw, y0 + bh);
      wood.addColorStop(0, '#ffb86b'); wood.addColorStop(1, '#f08a3c');
      ctx.fillStyle = wood;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0, y0, bw, bh, cell * 0.22) : ctx.rect(x0, y0, bw, bh); ctx.fill();
      ctx.strokeStyle = 'rgba(160,70,10,.18)'; ctx.lineWidth = 1;
      for (let i = 1; i < 9; i++) { ctx.beginPath(); ctx.moveTo(x0 + 6, y0 + bh * i / 9 + Math.sin(i) * 4); ctx.bezierCurveTo(x0 + bw * 0.3, y0 + bh * i / 9 - 5, x0 + bw * 0.7, y0 + bh * i / 9 + 5, x0 + bw - 6, y0 + bh * i / 9); ctx.stroke(); }

      // 次に抜ける段の帯
      const hr = fx.hammerRow != null ? fx.hammerRow : (game.winner ? -1 : game.nextRow);
      if (hr >= 0) {
        const left = game.roundsLeft;
        const pulse = left === 1 && !fx.hammer ? 0.5 + 0.5 * Math.sin(now / 120) : 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + pulse * 0.3})`;
        ctx.fillRect(this.bx - this.pad * 0.6, this.cy(hr) - cell / 2, C.COLS * cell + this.pad * 1.2, cell);
      }
      // 穴
      for (let c = 0; c < C.COLS; c++) for (let r = 0; r < C.ROWS; r++) {
        ctx.fillStyle = '#fff4e2';
        ctx.beginPath(); ctx.arc(this.cx(c), this.cy(r), R * 1.08, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(190,90,20,.35)'; ctx.lineWidth = 2; ctx.stroke();
      }
      // コマ
      const hide = fx.hide || {};
      const fall = fx.fall || null;
      for (let c = 0; c < C.COLS; c++) for (let r = 0; r < C.ROWS; r++) {
        const p = game.g[c][r]; if (!p || hide[c + ',' + r]) continue;
        let y = this.cy(r);
        if (fall && fall.map[c + ',' + r] != null) y -= fall.map[c + ',' + r] * cell * (1 - fall.t);
        let o = {};
        if (fx.win && fx.win[c + ',' + r]) { const k = Math.sin(now / 110); o = { sx: 1 + 0.08 * k, sy: 1 - 0.08 * k }; }
        if (fx.pop && fx.pop.map[c + ',' + r]) { const t = fx.pop.t; o = { alpha: 1 - t, sx: 1 + t * 0.6, sy: 1 + t * 0.6 }; }
        DG.drawDaruma(ctx, this.cx(c), y, R, p, o);
      }
      // 落ちてくるコマ
      if (fx.drop) DG.drawDaruma(ctx, this.cx(fx.drop.c), fx.drop.y, R, fx.drop.p, { sx: fx.drop.sx, sy: fx.drop.sy });
      // 抜けて飛んでいくコマ
      if (fx.fly) for (const f of fx.fly.list) {
        const t = fx.fly.t;
        DG.drawDaruma(ctx, this.cx(f.c) + t * t * cell * 9, this.cy(fx.fly.row) - Math.sin(t * Math.PI) * cell * 0.4, R, f.p, { rot: t * 7, alpha: 1 - t * 0.6 });
      }
      // 盤の手前のふち
      ctx.strokeStyle = 'rgba(255,230,190,.35)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0 + 1, y0 + 1, bw - 2, bh - 2, cell * 0.22) : ctx.rect(x0, y0, bw, bh); ctx.stroke();

      // 小槌と「あと○ターン」
      if (hr >= 0) {
        const hy = this.cy(hr);
        let hx = this.side * 0.5, rot = -0.5;
        if (fx.hammer) { const t = fx.hammer.t; hx += Math.sin(Math.min(1, t * 2) * Math.PI) * cell * 0.5; rot = -0.5 + Math.sin(Math.min(1, t * 2) * Math.PI) * 1.2; }
        DG.drawHammer(ctx, hx, hy - cell * 0.05, cell * 0.8, rot + Math.PI / 2 * 0);
        if (!fx.hammer && !game.winner) {
          const left = game.roundsLeft;
          ctx.fillStyle = left === 1 ? '#ff4d5e' : '#7a3b12';
          ctx.beginPath(); ctx.arc(this.side * 0.5, hy + cell * 0.42, cell * 0.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = `900 ${Math.round(cell * 0.26)}px "M PLUS Rounded 1c", system-ui, sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(left, this.side * 0.5, hy + cell * 0.43);
        }
      }

      // 上の「ここに落とす」予告
      if (s.hoverCol >= 0 && s.canInput && !fx.drop) {
        const c = s.hoverCol;
        ctx.fillStyle = 'rgba(255,255,255,.12)';
        ctx.fillRect(this.cx(c) - cell / 2, this.by - this.pad * 0.5, cell, C.ROWS * cell + this.pad);
        DG.drawDaruma(ctx, this.cx(c), this.top * 0.52, R * 0.92, game.turn, { alpha: 0.95 });
      }
      // 文字演出
      if (fx.label) {
        const t = fx.label.t;
        ctx.save(); ctx.globalAlpha = Math.min(1, t * 3);
        ctx.font = `900 ${Math.round(cell * 0.62)}px "Dela Gothic One", "M PLUS Rounded 1c", system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        ctx.lineWidth = cell * 0.16; ctx.strokeStyle = '#2a1608';
        const ly = this.by + C.ROWS * cell * 0.42;
        ctx.strokeText(fx.label.text, this.bx + C.COLS * cell / 2, ly);
        ctx.fillStyle = fx.label.color || '#ffd46b'; ctx.fillText(fx.label.text, this.bx + C.COLS * cell / 2, ly);
        ctx.restore();
      }
    }
  }
  DG.BoardView = BoardView;
})();
