from django.contrib import admin

from . import models

class MovieAdmin(admin.ModelAdmin):

    search_fields = ("title","genres__name")

    list_display = ("title","director","get_actors")

    def get_actors(self,instance):
        return ",".join([actor.name for actor in instance.actors.all()])
    get_actors.short_description = "Actors"

admin.site.register(models.Genre)
admin.site.register(models.Person)
admin.site.register(models.Movie,MovieAdmin)

######## CO2CHAMPION ########

class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'UID', 'email', 'total_employees', 'total_income', 'current_rank')
    search_fields = ('name', 'UID', 'email')
    list_filter = ('current_rank', 'total_employees')

class GoalAdmin(admin.ModelAdmin):
    list_display = ('company', 'start_emissions', 'target_emissions', 'deadline', 'start_date')
    search_fields = ('company__name',)
    list_filter = ('deadline',)

class ReportAdmin(admin.ModelAdmin):
    list_display = ('company', 'title', 'date', 'reduced_emissions')
    search_fields = ('company__name', 'title', 'description')
    list_filter = ('date',)

class RankHistoryAdmin(admin.ModelAdmin):
    list_display = ('rank', 'company', 'date')
    search_fields = ('rank', 'company', 'date')
    list_filter = ('date',)

admin.site.register(models.Company, CompanyAdmin)
admin.site.register(models.Goal, GoalAdmin)
admin.site.register(models.Report, ReportAdmin)
admin.site.register(models.RankHistory, RankHistoryAdmin)