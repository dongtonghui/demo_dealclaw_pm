#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

# 读取原文件
with open('prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 修复视图切换函数 - 添加对WhatsApp视图的支持
old_switch_view = '''        // 切换视图
        function switchView(view) {
            // 更新导航状态
            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.remove('text-accent', 'bg-blue-50');
                el.classList.add('text-slate-600');
            });
            document.getElementById('nav-' + view).classList.add('text-accent', 'bg-blue-50');
            document.getElementById('nav-' + view).classList.remove('text-slate-600');
            
            // 隐藏所有视图
            document.getElementById('view-chat').classList.add('hidden');
            document.getElementById('view-tasks').classList.add('hidden');
            document.getElementById('view-leads').classList.add('hidden');
            document.getElementById('view-content').classList.add('hidden');
            document.getElementById('main-chat').classList.remove('hidden');
            
            // 显示选中视图
            if (view === 'chat') {
                document.getElementById('view-chat').classList.remove('hidden');
            } else if (view === 'tasks') {
                document.getElementById('view-tasks').classList.remove('hidden');
                document.getElementById('view-tasks').classList.add('flex');
            } else if (view === 'leads') {
                document.getElementById('view-leads').classList.remove('hidden');
                document.getElementById('view-leads').classList.add('flex');
            } else if (view === 'content') {
                document.getElementById('view-content').classList.remove('hidden');
                document.getElementById('view-content').classList.add('flex');
            }
            
            lucide.createIcons();
        }'''

new_switch_view = '''        // 切换视图
        function switchView(view) {
            // 更新导航状态
            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.remove('text-accent', 'bg-blue-50');
                el.classList.add('text-slate-600');
            });
            if (document.getElementById('nav-' + view)) {
                document.getElementById('nav-' + view).classList.add('text-accent', 'bg-blue-50');
                document.getElementById('nav-' + view).classList.remove('text-slate-600');
            }
            
            // 隐藏所有视图
            document.getElementById('view-chat').classList.add('hidden');
            document.getElementById('view-tasks').classList.add('hidden');
            document.getElementById('view-leads').classList.add('hidden');
            document.getElementById('view-content').classList.add('hidden');
            const whatsappView = document.getElementById('view-whatsapp');
            if (whatsappView) whatsappView.classList.add('hidden');
            document.getElementById('main-chat').classList.remove('hidden');
            
            // 显示选中视图
            if (view === 'chat') {
                document.getElementById('view-chat').classList.remove('hidden');
            } else if (view === 'tasks') {
                document.getElementById('view-tasks').classList.remove('hidden');
                document.getElementById('view-tasks').classList.add('flex');
            } else if (view === 'leads') {
                document.getElementById('view-leads').classList.remove('hidden');
                document.getElementById('view-leads').classList.add('flex');
            } else if (view === 'content') {
                document.getElementById('view-content').classList.remove('hidden');
                document.getElementById('view-content').classList.add('flex');
            } else if (view === 'whatsapp') {
                const wpView = document.getElementById('view-whatsapp');
                if (wpView) {
                    wpView.classList.remove('hidden');
                    wpView.classList.add('flex');
                    initWhatsAppView();
                }
            }
            
            lucide.createIcons();
        }'''

content = content.replace(old_switch_view, new_switch_view)

print("已修复视图切换函数")

# 保存修改
with open('prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("完成!")
