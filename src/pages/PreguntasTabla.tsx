import { PageHeader } from "../components/ui/page-header";
import { useNavigate } from "react-router-dom";

const Preguntas = () => {
    const navigate = useNavigate();

    const handleCreateNew = () => {
        console.log("Creating a new...")
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Preguntas"
                subtitle={`Gestiona y administra todos los establecimientos del sistema`}
                breadcrumbs={[
                    { label: "Inicio", onClick: () => navigate('/') },
                    { label: "Establecimientos" }
                ]}
                actions={[
                    {
                        label: "Nuevo Pregunta",
                        onClick: handleCreateNew,
                        variant: "default",
                        icon: ""
                    }
                ]}
            />
        </div>
    );
}

export default Preguntas;