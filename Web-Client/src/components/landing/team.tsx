import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "ui/avatar"

const teamMembers = [
  {
    name: "Brayan Estiven Carvajal Padilla",
    role: "Desarrollador Fullstack",
    image: "/brayan-img.webp",
  },
  {
    name: "Diego Fernando Cuellar Hernandez",
    role: "Desarrollador Fullstack",
    image: "/diego-img.webp",
  },
  
]

export default function Team() {
  return (
    <section id="equipo" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance mb-4">Nuestro Equipo</h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto mb-8">
            Aprendices del Tecnólogo en Análisis y Desarrollo de Software del SENA comprometidos con la innovación en transporte urbano
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {teamMembers.map((member, index) => (
            <Card key={index} className="flex flex-col justify-center items-center h-full min-h-[320px] w-80 p-6 bg-card border border-border text-card-foreground hover:shadow-lg transition-shadow transition-all duration-200 hover:shadow-xl hover:scale-[1.02] text-center">
              <CardHeader className="w-full p-0 mb-2 flex flex-col items-center justify-center">
                <Avatar className="w-20 h-20 mb-4 mx-auto">
                  <AvatarImage src={member.image || "/placeholder.svg"} alt={member.name} />
                </Avatar>
                <CardTitle className="text-lg w-full text-center break-words max-w-full mx-auto px-2">{member.name}</CardTitle>
              </CardHeader>
              <CardContent className="w-full p-0 flex justify-center">
                <CardDescription className="font-medium text-accent text-center w-full break-words">{member.role}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}
