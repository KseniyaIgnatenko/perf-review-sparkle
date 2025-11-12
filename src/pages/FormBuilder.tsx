import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Copy, Eye } from 'lucide-react';
import { useFormTemplates } from '@/hooks/useFormTemplates';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormTemplateEditor } from '@/components/FormTemplateEditor';
import { FormTemplate } from '@/hooks/useFormTemplates';

export default function FormBuilder() {
  const { templates, isLoading, createVersion } = useFormTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getFormTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      self_assessment: 'Самооценка',
      peer_review: 'Оценка коллег',
      potential_assessment: 'Оценка потенциала',
      manager_feedback: 'Обратная связь менеджера',
      custom: 'Пользовательская форма',
    };
    return labels[type] || type;
  };

  const handleCreateVersion = (templateId: string) => {
    createVersion(templateId);
  };

  const handleEdit = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Конструктор форм</h1>
            <p className="text-muted-foreground">
              Создавайте и управляйте формами оценки
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Создать форму
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Создание новой формы</DialogTitle>
              </DialogHeader>
              <FormTemplateEditor
                onSuccess={() => setIsCreateDialogOpen(false)}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                      {template.is_active ? 'Активна' : 'Неактивна'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">v{template.version}</span>
                  </div>
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <CardDescription>
                    {getFormTypeLabel(template.form_type)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {template.department && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Департамент:</span>
                        <span>{template.department.name}</span>
                      </div>
                    )}
                    {template.period && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Период:</span>
                        <span>{template.period}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateVersion(template.id)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Версия
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактирование формы</DialogTitle>
            </DialogHeader>
            {selectedTemplate && (
              <FormTemplateEditor
                template={selectedTemplate}
                onSuccess={() => setIsEditDialogOpen(false)}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
