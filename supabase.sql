-- UnNo Tea: thêm mã riêng để khách chỉ xem được đơn của mình
alter table public.orders
add column if not exists customer_token text;

create index if not exists orders_customer_token_idx
on public.orders(customer_token);

create or replace function public.track_order(
  p_order_id bigint,
  p_token text
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', o.id,
    'table_number', o.table_number,
    'status', o.status,
    'note', o.note,
    'created_at', o.created_at,
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'item_name', oi.item_name,
          'price', oi.price,
          'quantity', oi.quantity
        )
        order by oi.id
      )
      from public.order_items oi
      where oi.order_id = o.id
    ), '[]'::jsonb)
  )
  from public.orders o
  where o.id = p_order_id
    and o.customer_token = p_token
  limit 1;
$$;

revoke all on function public.track_order(bigint,text) from public;
grant execute on function public.track_order(bigint,text)
to anon, authenticated;
