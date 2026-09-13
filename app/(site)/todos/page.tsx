import { createClient } from "@/utils/supabase/server";

export default async function TodosPage() {
  const supabase = await createClient();
  const { data: todos } = await supabase.from("todos").select();

  return (
    <main>
      <h1>Todos</h1>
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
      </ul>
    </main>
  );
}
