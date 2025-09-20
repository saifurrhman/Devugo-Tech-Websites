import React from 'react';

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <a href="/admin">Dashboard</a>
      <a href="/admin/portfolio">Portfolio</a>
      <a href="/admin/blog">Blog</a>
      <a href="/admin/team">Team</a>
      <a href="/admin/contacts">Contacts</a>
      <a href="/admin/analytics">Analytics</a>
    </aside>
  );
}
