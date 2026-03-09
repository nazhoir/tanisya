"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";

import { Button }       from "@tanisya/ui/components/button";
import { Input }        from "@tanisya/ui/components/input";
import { ProjectsTable }       from "./projects-table";
import { ProjectFormDialog }   from "./project-form-dialog";

export function ProjectsClient() {
  const qc = useQueryClient();
  const [page, setPage]             = useState(1);
  const [keyword, setKeyword]       = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<any>(null);

  const query = useQuery(
    orpc.projects.getAll.queryOptions({
      input: { page, limit: 10, keyword: keyword || undefined },
    })
  );

  const createMutation = useMutation(
    orpc.projects.create.mutationOptions({
      onSuccess: () => {
        toast.success("Project berhasil dibuat");
        qc.invalidateQueries({ queryKey: ["projects"] });
        setDialogOpen(false);
      },
      onError: () => toast.error("Gagal membuat project"),
    })
  );

  const updateMutation = useMutation(
    orpc.projects.update.mutationOptions({
      onSuccess: () => {
        toast.success("Project berhasil diupdate");
        qc.invalidateQueries({ queryKey: ["projects"] });
        setDialogOpen(false);
        setEditing(null);
      },
      onError: () => toast.error("Gagal mengupdate project"),
    })
  );

  const deleteMutation = useMutation(
    orpc.projects.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Project berhasil dihapus");
        qc.invalidateQueries({ queryKey: ["projects"] });
      },
      onError: () => toast.error("Gagal menghapus project"),
    })
  );

  const handleSubmit = (values: any) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground">
            Kelola semua project Anda
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Buat Project
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari project..."
          className="pl-8"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      <ProjectsTable
        data={query.data?.data ?? []}
        meta={query.data?.meta}
        isLoading={query.isLoading}
        page={page}
        onPageChange={setPage}
        onEdit={(row) => { setEditing(row); setDialogOpen(true); }}
        onDelete={(id) => deleteMutation.mutate({ id })}
      />

      {/* Dialog */}
      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}
        defaultValues={editing}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}